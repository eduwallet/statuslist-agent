import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    BaseEntity,
    BeforeInsert,
    BeforeUpdate,
} from 'typeorm'

@Entity('statuslist')
export class StatusList extends BaseEntity {
    @PrimaryGeneratedColumn('increment')
    //@ts-ignore
    id: number;
    
    @Column('varchar')
    //@ts-ignore
    name: string

    @Column('int')
    //@ts-ignore
    index: number

    @Column('int')
    //@ts-ignore
    size: number

    @Column('int')
    //@ts-ignore
    used: number

    @Column({type: 'int', nullable:true})
    //@ts-ignore
    bitsize?: number

    @Column('text')
    //@ts-ignore
    content: string

    @Column('text')
    //@ts-ignore
    revoked: string

    @Column({type: 'timestamp', nullable: true})
    expirationDate?: Date

    @BeforeInsert()
    setSaveDate() {
        this.saveDate = new Date()
        this.updateDate = new Date()
    }

    @BeforeUpdate()
    setUpdateDate() {
        this.updateDate = new Date()
    }

    @Column({ type: 'timestamp', select: false })
    //@ts-ignore
    saveDate: Date

    @Column({ type: 'timestamp', select: false })
    //@ts-ignore
    updateDate: Date
}
