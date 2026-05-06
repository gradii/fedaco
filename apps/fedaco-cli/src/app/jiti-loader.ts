import { createJiti } from 'jiti';

let cachedJiti: ReturnType<typeof createJiti> | null = null;

function getJiti() {
  if (!cachedJiti) {
    cachedJiti = createJiti(process.cwd(), {
      interopDefault: true,
    });
  }
  return cachedJiti;
}

export function jitiRequire(id: string): any {
  return getJiti()(id);
}
