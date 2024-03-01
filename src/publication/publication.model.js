import {Schema, model} from 'mongoose';

const publicationShema = Schema({
    user:{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'user is required.']
    },
    title:{
        type: String,
        required: [true, 'title is required.']
    },
    comment:{
        type: String,
        required:[true, 'comment is required']
    },
    category:[{
        type: Schema.Types.ObjectId,
        ref: 'Category'
    }],
    comments:[{
        user:{
            type: Schema.Types.ObjectId,
            ref:'User'
        },
        comment:{
            type: String
        }
    }],
},{
    versionKey: false
})

//exportar el schema
export default model('Publication', publicationShema);