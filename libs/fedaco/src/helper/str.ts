export function replaceArray(subject: string, search: string, replaces: string[]) {
  const segments = subject.split(search);
  let result     = segments.shift();
  for (const segment of segments) {
    result += (replaces.shift() ?? search) + segment;
  }
  return result;
}
