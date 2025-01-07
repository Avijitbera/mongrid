import {Collection} from './src/decorators/collection'
import {Field} from './src/decorators/field'
import { RelationType } from './src/types/relation_type';

@Collection("User")
class User {
    constructor(){
        this.name = 'test'
    }
    @Field({name:"name", required:true, relationOptions:{
        relationType:RelationType.ManyToMany,
        target:""
    }})
    name:string;
}


const user = new User()

console.log(user)
