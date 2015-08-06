'use-strict';

var StringUtils = require('./string-utils');
var React = require('react-native');

var {
	View,
	WebView,
	ActivityIndicatorIOS,
} = React;

var EpisodeDetail = React.createClass({
	render: function () {
		if (this.state.loading) {
			return  <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}><ActivityIndicatorIOS size='large' color='gray' /></View>
		}
		return <View style={{flex: 1}}>
			<WebView 
				ref={'webview'}
				html={this.state.episodeHtml} />
		</View>
	},
	getInitialState: function() {
		return {
			loading: true,
			episodeHtml: '<html><body>...</body></html>',
		};
	},
	componentWillMount: function() {
		fetch(this.props.episode.detailURL)
			.then((response) => response.text())
			.then(responseText => {
				const prefixMatching = 'class="podcast_table_home">';
				var beginIndex = responseText.indexOf(prefixMatching);
				if (beginIndex == -1) {
					return '..';
				}
				beginIndex = responseText.indexOf(prefixMatching, beginIndex + prefixMatching.length);
				if (beginIndex == -1) {
					return '..';
				}

				const text = "<html><body style=\"font-family:'Lucida Grande', 'Lucida Sans Unicode', 'STHeitiSC', 'Helvetica','Arial','Verdana','sans-serif';\">" 
					+ StringUtils.innerText(responseText.substring(beginIndex, responseText.length), prefixMatching, '</table>') 
					+ "</body></html>";

				var audioIndexes = new Map();
				const audioIndexesPrefixMatching = 'Audio Index:';
				beginIndex = responseText.indexOf(audioIndexesPrefixMatching);
				if (beginIndex != -1) {
					const audioIndexesHtml = responseText.substring(beginIndex + audioIndexesPrefixMatching.length, responseText.indexOf('</span>', beginIndex + audioIndexesPrefixMatching.length));
					if (audioIndexesHtml.indexOf('<br>') != -1) {
						audioIndexesHtml.split('<br>')
							.filter(audioIndexesHtmlItem => audioIndexesHtmlItem.trim().length != 0)
							.map(audioIndexesStringItem => {
								const beginIndex = audioIndexesStringItem.indexOf(':');
								if (beginIndex != -1) {
									audioIndexes.set(audioIndexesStringItem.substring(0, beginIndex).trim(), audioIndexesStringItem.substring(beginIndex + 1, audioIndexesStringItem.length).trim());
								}
							});
					}
				}

				return {
					text: text,
					indexes: audioIndexes
				};
			})
			.then(detail => {
				this.setState({
					loading: false,
					episodeHtml: detail.text,
				});
			})
			.catch((error) => {
				console.warn(error);
			});
	},
});

module.exports = EpisodeDetail;