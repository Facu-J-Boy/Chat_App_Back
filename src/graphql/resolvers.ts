import User from '../models/user.model'; // ajustá el path a tu modelo real

export const resolvers = {
  Query: {
    users: async () => await User.findAll(),
    user: async (_: any, { id }: { id: number }) =>
      await User.findByPk(id),
  },
  Mutation: {
    createUser: async (
      _: any,
      { name, email }: { name: string; email: string }
    ) => {
      const user = await User.create({ name, email });
      return user;
    },
  },
};
