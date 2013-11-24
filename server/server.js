/*
 * Copyright (c) 2013 Krishna Srinivas
 * MIT License
 */

Meteor.PipeServer = function() {
	var pipeserver = this;
	var tomaster = new EventEmitter();
	var frommaster = new EventEmitter();
	var streamName = '_meteor_pipe_';
	var methods = {};

	Meteor.publish(streamName, function (sharecode, type) {
		var self = this;

		var pushData = function (data) {
			var id = Random.id();
			self.added (streamName, id, data);
		};
		if (type === 'master') {
			tomaster.on(sharecode, pushData);
		} else if (type === 'slave') {
			frommaster.on (sharecode, pushData);
		} else {
			//err
		}

		this.onStop(function () {
			if (type === 'master') {
				tomaster.off(sharecode, pushData);
			} else if (type === 'slave') {
				frommaster.off (sharecode, pushData);
			}
		});

		this.ready();
	});

	methods[streamName] = function (sharecode, type, data) {

		if (type === 'master') {
			frommaster.emit (sharecode, data);
		} else if (type === 'slave') {
			tomaster.emit (sharecode, data);
		}
	}

	Meteor.methods (methods);
}

