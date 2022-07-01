const { SlashCommandBuilder } = require("@discordjs/builders");
const Discord = require("discord.js");
const {
  createWarn,
  removeWarnById,
  removeWarnings,
  getWarnings,
} = require("../models/warning.model");

module.exports = {
  ...new SlashCommandBuilder()
    .setName("warn")
    .setDescription("test")
    .addSubcommand((cmd) =>
      cmd
        .setName("create")
        .setDescription("Warns a member")
        .addUserOption((opt) =>
          opt
            .setName("member")
            .setDescription("member to warn")
            .setRequired(true)
        )
        .addStringOption((opt) =>
          opt
            .setName("reason")
            .setDescription("reason of the warn")
            .setRequired(true)
        )
    )
    .addSubcommand((cmd) =>
      cmd
        .setName("remove")
        .setDescription(
          "Remove warnings for server or a member. if no [id] or [filter_by_user], all warnings will be removed"
        )
        .addStringOption((opt) =>
          opt.setName("id").setDescription("Warn id").setRequired(false)
        )
        .addUserOption((opt) =>
          opt
            .setName("filter_by_user")
            .setDescription("User")
            .setRequired(false)
        )
    )
    .addSubcommand((cmd) =>
      cmd
        .setName("list")
        .setDescription("Get the list of warnings for the server or a member")
        .addUserOption((opt) =>
          opt
            .setName("member")
            .setDescription("get member warnings")
            .setRequired(false)
        )
    ),

  /**
   * @param {Discord.Client} client
   * @param {Discord.CommandInteraction} interaction
   */
  async run(client, interaction) {
    const cmd = interaction.options.getSubcommand(true);

    if (!interaction.member.permissions.has("ADMINISTRATOR"))
      return interaction.reply({
        content: "**You need `Administrator` permission to use this command**",
        ephemeral: true,
      });

    switch (cmd) {
      case "create":
        const targetMember = interaction.options.getMember("member");
        const reason = interaction.options.getString("reason", true);

        if (!targetMember)
          return interaction.reply(
            `${
              interaction.options.getUser("member").username
            } is not a member !`
          );
        if (targetMember.id === interaction.user.id)
          return interaction.reply({
            content: "**You cannot warn yourself !**",
            ephemeral: true,
          });
        if (targetMember.id === client.user.id)
          return interaction.reply({
            content: "**I'm too cool to be warned 😎**",
            ephemeral: true,
          });
        if (
          (interaction.member.roles?.highest.position <=
            targetMember.roles?.highest.position &&
            interaction.member.id !== interaction.guild.ownerId) ||
          targetMember.id === interaction.guild.ownerId
        )
          return interaction.reply({
            content: `You cannot warn **${targetMember.user.username}** 👀`,
            ephemeral: true,
          });

        await interaction.deferReply();

        createWarn(interaction.guildId, {
          memberId: targetMember.id,
          modId: interaction.member.id,
          reason: reason,
        })
          .then((warn) => {
            client.emit("warnCreate", {
              guild: interaction.guild,
              user: targetMember.user,
              reason: warn.reason,
              modId: warn.modId,
              id: warn._id,
            });
            interaction.editReply(
              `Warned **${targetMember.user.username}** ✅`
            );
            return targetMember.send({
              embeds: [
                {
                  title: "You Were Warned ⚠️",
                  description: `Reason \n > ${reason}`,
                  timestamp: Date.now(),
                  color: "#faa81a",
                  footer: {
                    text: interaction.guild.name,
                    iconURL: interaction.guild.iconURL({ dynamic: true }),
                  },
                },
              ],
            });
          })
          .catch((err) => false);

        break;
      case "remove":
        await interaction.deferReply();

        const warnId = interaction.options.getString("id");
        const user = interaction.options.getUser("filter_by_user");

        if (warnId) {
          removeWarnById(warnId)
            .then(({ deletedCount }) => {
              interaction.editReply(
                deletedCount > 0
                  ? `Removed the warning with the ID \`${warnId}\` ✅`
                  : `Found **0** warnings with \`${warnId}\` id`
              );
            })
            .catch(console.error);
        } else {
          let messagesDeletedMsg = user
            ? `Removed all warnings for \`${user.username}\` ✅`
            : "Removed all server warnings ✅";
          let noDeletionMsg = user
            ? `Removed all warnings for \`${user.username}\` ✅`
            : "Removed all server warnings ✅";

          removeWarnings(interaction.guildId, user?.id)
            .then(({ deletedCount }) =>
              interaction.editReply(
                deletedCount > 0 ? messagesDeletedMsg : noDeletionMsg
              )
            )
            .catch(console.error);
        }

        break;
      case "list":
        await interaction.deferReply();

        const targetUser = interaction.options.getUser("member");
        const isMember = Boolean(interaction.options.getMember("member"));

        const warnings = await getWarnings(interaction.guildId, targetUser?.id);

        if (warnings.length === 0)
          return interaction.editReply(
            `${
              targetUser
                ? `**${targetUser.username}**${
                    !isMember ? "(`not a member`)" : ""
                  }`
                : "This server"
            } has **0** warnings`
          );

        const WARNINGS_PER_PAGE = 5;
        let embed = new Discord.MessageEmbed();
        let pageIndex = 0;
        let pages = Math.ceil(warnings.length / WARNINGS_PER_PAGE);

        embed
          .setTitle(
            `${warnings.length} ${
              warnings.length === 1 ? "Warning" : "Warnings"
            } - Page (${pageIndex + 1}/${pages})`
          )
          .setFooter({
            text: `${
              targetUser
                ? "Warnings for " +
                  targetUser.username +
                  (isMember ? " (not a member)" : "")
                : interaction.guild.name + " Total Warnings"
            }`,
            iconURL: targetUser
              ? targetUser.avatarURL()
              : interaction.guild.iconURL(),
          })
          .setThumbnail(
            targetUser
              ? targetUser.avatarURL({ dynamic: true })
              : interaction.guild.iconURL({ dynamic: true })
          )
          .setColor("#ffcc4d");

        /**
         * @param {Discord.MessageEmbed} embed
         * @param {array} warnings
         */
        const displayWarnings = (embed, warnings) => {
          return warnings.map((warning, i) => {
            const date = new Date(warning.timestamp);
            const hours = Intl.DateTimeFormat(undefined, {
              hour: "numeric",
              hour12: true,
            })
              .formatToParts(date)
              .find(({ type }) => type === "hour").value; // in 12 hours
            const emoji = `:clock${hours}${
              date.getMinutes() >= 30 ? "30" : ""
            }:`;
            embed.addField(
              `#${i + 1}`,
              `
              ${emoji} <t:${Math.round(date.getTime() / 1000)}:f>
              By: <@${warning.modId}>${
                !targetUser ? `, User : <@${warning.memberId}>` : ""
              }
              Warn id: \`${warning.id}\`
              \`\`\`${warning.reason}\`\`\`
              `
            );
          });
        };

        displayWarnings(embed, warnings.slice(0, WARNINGS_PER_PAGE));

        const message = await interaction.editReply({
          embeds: [embed],
          components:
            pages > 1
              ? [
                  new Discord.MessageActionRow().addComponents(
                    new Discord.MessageButton()
                      .setEmoji("<:backward:990514685860270100>")
                      .setCustomId("backward")
                      .setStyle("SECONDARY")
                      .setDisabled(true),
                    new Discord.MessageButton()
                      .setEmoji("<:forward:990514473653657671>")
                      .setCustomId("forward")
                      .setStyle("SECONDARY")
                  ),
                ]
              : null,
        });

        if (pages > 1) {
          const collector = message.createMessageComponentCollector({
            /**
             * @param {Discord.ButtonInteraction} i
             */
            filter(i) {
              return (
                i.user.id === interaction.user.id &&
                (i.customId === "backward" || i.customId === "forward")
              );
            },
            time: pages * 10_000,
          });

          collector.on("collect", (i) => {
            const [backwardBtn, forwardBtn] = message.components[0].components;

            if (i.customId === "backward") {
              pageIndex--;
              forwardBtn.setDisabled(false);
              if (pageIndex === 0) backwardBtn.setDisabled(true);
            } else if (i.customId === "forward") {
              pageIndex++;
              backwardBtn.setDisabled(false);
              if (pageIndex + 1 === pages) forwardBtn.setDisabled(true);
            }

            const startIndex = pageIndex * WARNINGS_PER_PAGE;
            const targetWarnings = warnings.slice(
              startIndex,
              startIndex + WARNINGS_PER_PAGE
            );

            embed.setTitle(
              `${warnings.length} Warnings - Page (${pageIndex + 1}/${pages})`
            );
            embed.fields = [];
            displayWarnings(embed, targetWarnings);
            message.edit({ embeds: [embed], components: message.components });
          });

          collector.on("end", () => {
            embed.footer.text += " ~ timed out";
            embed.setColor("#000");
            message.edit({ embeds: [embed] });
          });
        }
        break;
    }
  },
};
