function normallizeContentAndMentions(content, mentions) {
  let newMentions = mentions.sort((m1, m2) => m2.startAt - m1.startAt)
  let newContent = content;
  newMentions.forEach(mention => {
    newContent = newContent.slice(0, mention.startAt) + '@' + newContent.slice(mention.startAt + mention.text.length);
  });
  let replacedLength = 0;
  return {
    content: newContent,
    mentions: newMentions.map(mention => {
      const position = mention.startAt - replacedLength;
      replacedLength += mention.text.length - 1;
      return {
        position,
        text: mention.text,
        userRef: mention.userRef,
      };
    }),
  };
}

module.exports = {
  normallizeContentAndMentions,
};