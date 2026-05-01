export const chunkText = (text) => {
  const lines = text.split("\n").map(l => l.trim());

  const chunks = [];

  for (const line of lines) {
    // skip garbage
    if (
      line.length < 40 ||
      /^\d+\s*\|\s*page/i.test(line) ||
      /unique id|reporting status|health education/i.test(line)
    ) continue;

    // only keep meaningful disease rows
    if (
      /(measles|dengue|malaria|chickenpox|diarrhoeal|poisoning|hepatitis|chikungunya)/i.test(line) &&
      /\d+/.test(line)
    ) {
      chunks.push(line);
    }
  }

  return chunks;
};