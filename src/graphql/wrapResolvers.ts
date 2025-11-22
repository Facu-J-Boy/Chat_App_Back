import { AuthenticationError } from 'apollo-server-errors';

export function protectResolvers(
  resolvers: any,
  publicOps: string[] = []
) {
  const protectedResolvers: any = {};

  for (const typeName in resolvers) {
    protectedResolvers[typeName] = {};

    for (const fieldName in resolvers[typeName]) {
      const originalResolver = resolvers[typeName][fieldName];

      // ⛔ NO tocar Subscription
      if (typeName === 'Subscription') {
        protectedResolvers[typeName][fieldName] = originalResolver;
        continue;
      }

      // ⛔ NO tocar resolvers que son objetos (p. ej. { subscribe, resolve })
      if (
        typeof originalResolver === 'object' &&
        (originalResolver.subscribe || originalResolver.resolve)
      ) {
        protectedResolvers[typeName][fieldName] = originalResolver;
        continue;
      }

      // ✔️ Esto sí aplica SOLO a resolvers normales (Query / Mutation)
      protectedResolvers[typeName][fieldName] = async (
        parent: any,
        args: any,
        context: any,
        info: any
      ) => {
        if (!publicOps.includes(fieldName)) {
          if (!context.user) {
            throw new AuthenticationError('No autorizado');
          }
        }
        return originalResolver(parent, args, context, info);
      };
    }
  }

  return protectedResolvers;
}
