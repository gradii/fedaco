export function replaceArray(subject: string, search: string, replaces: string[]) {
  replaces = [...replaces];
  const segments = subject.split(search);
  let result = segments.shift();
  for (const segment of segments) {
    result += (replaces.shift() ?? search) + segment;
  }
  return result;
}
