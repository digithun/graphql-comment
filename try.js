function denormalize(text) {
  const mentionTest = /@{([\w\s.]*)}\(([a-zA-Z0-9]*)\)/i;
  if (!text.length) {
    return [];
  }
  if (mentionTest.test(text)) {
    const matches = mentionTest.exec(text);
    const lastIndex = matches.index + matches[0].length;
    return [].concat(
      matches.index !== 0 ? renderText(text.slice(0, matches.index)) : [],
      {
        type: 'mention',
        text: matches[1],
        id: matches[2],
        length: matches[1].length,
      },
      denormalize(text.slice(lastIndex))
    );
  }
  return [renderText(text)];
}

function cleanText(text) {
  return denormalize(text).map(obj => obj.text ? obj.text : renderText(obj)).join('');
}

function normalize(arr) {
  if (!arr.length) return [];
  if (typeof arr[0] === 'string') {
    return arr[0] + normalize(arr.slice(1));
  }
  return `@{${arr[0].text}}(${arr[0].id})` + normalize(arr.slice(1));
}

function escape(text) {
  return text.replace(/#/g, '##').replace(/@/g, '@#');
}

function renderText(text) {
  return text.replace(/@#/g, '@').replace(/##/g, '#');
}

console.log(denormalize('@#@{Anonymousab}(123)'))
