export function decodeHtmlEntities(text: string | undefined | null) {
  if (!text) return '';
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value;
}
