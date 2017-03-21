function denormailize(text) {
  const mentionTest = /@{([\w\s]*)}\(([a-zA-Z0-9]*)\)/i;
  if (!text.length) {
    return [];
  }
  if (mentionTest.test(text)) {
    const matches = mentionTest.exec(text);
    const lastIndex = matches.index + matches[0].length;
    return [].concat([
      matches.index !== 0 ? text.slice(0, matches.index) : [],
      {
        type: 'mention',
        text: matches[1],
        id: matches[2],
      },
      ...denormailize(text.slice(lastIndex)),
    ]);
  }
  return [text];
}
