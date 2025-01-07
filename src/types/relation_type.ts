export enum RelationType {
    OneToOne = 'oneToOne',
    OneToMany = 'oneToMany',
    ManyToOne = 'manyToOne',
    ManyToMany = 'manyToMany'
}

export interface RelationOptions {
    relationType: RelationType
    foreignKey?: string;
    target?: string
    cascade?: boolean
}