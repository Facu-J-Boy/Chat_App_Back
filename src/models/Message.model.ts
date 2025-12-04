import {
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import Chat from './chat.model';
import User from './user.model';

enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
}

@Table({ tableName: 'messages', timestamps: true })
class Message extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id!: number;

  @Column({ type: DataType.TEXT, allowNull: false })
  text!: string;

  @Column({ type: DataType.DATE(3), allowNull: false })
  createdAt!: Date;

  @Column({
    type: DataType.ENUM(...Object.values(MessageStatus)),
    allowNull: false,
    defaultValue: MessageStatus.SENT,
  })
  status!: MessageStatus;

  @ForeignKey(() => User)
  @Column(DataType.BIGINT)
  senderId!: number;

  @ForeignKey(() => Chat)
  @Column(DataType.BIGINT)
  chatId!: number;

  @BelongsTo(() => User)
  sender!: User;

  @BelongsTo(() => Chat)
  chat!: Chat;
}

export default Message;
