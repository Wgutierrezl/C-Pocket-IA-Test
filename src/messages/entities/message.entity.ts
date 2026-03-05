import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity('messages')
export class Messages{
    @PrimaryGeneratedColumn()
    id:number

    @Column()
    phone:string

    @Column('text')
    userMessage:string

    @Column('text')
    botResponse:string

    @CreateDateColumn()
    createAt:Date
}