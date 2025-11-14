import {
  AutoIncrement,
  BelongsToMany,
  Column,
  DataType,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import Message from './message.model';
import User from './user.model';
import UserChat from './userChat.model';

@Table({ tableName: 'chats', timestamps: false })
class Chat extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id!: number;

  @Column({ type: DataType.STRING, allowNull: true })
  name?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  chat_image?: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  isGroup!: boolean;

  @HasMany(() => Message)
  messages!: Message[];

  @BelongsToMany(() => User, () => UserChat)
  currentUser!: User[];

  @BelongsToMany(() => User, () => UserChat)
  users!: User[];
}

export default Chat;
