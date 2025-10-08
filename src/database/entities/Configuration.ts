import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    BaseEntity,
    BeforeInsert,
    BeforeUpdate,
} from 'typeorm'

@Entity('statuslistconf')
export class Configuration extends BaseEntity {
    @PrimaryGeneratedColumn('increment')
    //@ts-ignore
    id: number;
    
    @Column('varchar')
    //@ts-ignore
    name: string

    @Column('text')
    //@ts-ignore
    tokens: text

    @Column('text')
    //@ts-ignore
    messages: text

    @Column('int')
    //@ts-ignore
    size: number

    @Column('int')
    //@ts-ignore
    bitsize: number

    @Column('varchar')
    //@ts-ignore
    purpose: string

    @Column('varchar')
    //@ts-ignore
    type: string

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
