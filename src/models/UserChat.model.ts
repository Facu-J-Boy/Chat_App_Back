import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import Chat from './chat.model';
import User from './user.model';

@Table({ tableName: 'user_chat', timestamps: false })
class UserChat extends Model {
  @ForeignKey(() => User)
  @Column(DataType.BIGINT)
  userId!: number;

  @ForeignKey(() => Chat)
  @Column(DataType.BIGINT)
  chatId!: number;
}

export default UserChat;
