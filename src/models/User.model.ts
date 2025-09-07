import {
  PrimaryKey,
  Table,
  AutoIncrement,
  Column,
  DataType,
  BelongsToMany,
  HasMany,
  Model,
} from 'sequelize-typescript';
import Chat from './chat.model';
import Message from './message.model';
import UserChat from './userChat.model';

@Table({ tableName: 'users', timestamps: false })
class User extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  userName!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  email!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  profile_image?: string;

  @HasMany(() => Message)
  messages?: Message[];

  @BelongsToMany(() => Chat, () => UserChat)
  chats?: Chat[];
}

export default User;
