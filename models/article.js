var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var newsSchema = new Schema ({
    title : {
        type: String,
        trim: true,
    },
    link: {
        type: String,
        trim: true,
        required: "Link is required"
    },
    date: {
        type: Date,
        default: Date.now
    },
    comment: {
        type: Schema.Types.ObjectId,
        ref: "Comment"
      }
})

var Article = mongoose.model("News", newsSchema);

module.exports = Article;