var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

var ProgressSchema = mongoose.Schema({
	user_id : {
		type: String,
		required: true,
	},

	pathway_id : {
		type: String,
	},
	
	collection_id : {
		type: String,
	},

	resource_ids : Object,

	quizzes : [{
		QuizNumber: String,
		TotalQuestion: Number,
		CorrectAnswers: Number
	}],

	current_gp_id : {
		type: String,
	},

	current_resource_id : {
		type: String,
	}
});

module.exports = mongoose.model('UserProgress', ProgressSchema);




