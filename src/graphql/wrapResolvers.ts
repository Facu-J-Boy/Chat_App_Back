// src/graphql/wrapResolvers.ts
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
      protectedResolvers[typeName][fieldName] = async (
        parent: any,
        args: any,
        context: any,
        info: any
      ) => {
        // Excluir queries/mutations públicas
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
