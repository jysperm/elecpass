export function endsWithNewLine(content) {
  return content.endsWith('\n') ? content : `${content}\n`
}
