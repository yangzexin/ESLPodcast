'use strict';

var EpisodeDetail = require('./episode-detail');

var StringUtils = require('./string-utils');
var React = require('react-native');

var {
  StyleSheet,
  Text,
  View,
  ListView,
  TouchableHighlight,
} = React;

var EpisodeList = React.createClass({
  getInitialState: function() {
    return {
      dataSource: new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}),
    };
  },
  render: function() {
    return (
      <ListView style={styles.episodeList} dataSource={this.state.dataSource} renderRow={(rowData) => 
        <TouchableHighlight underlayColor='#3b3b3b' onPress={this._viewEpisode.bind(this, rowData)}>
          <View style={styles.episodeItemContainer}>
            <Text style={styles.episodeTitle}>{rowData.title}</Text>
            <Text style={styles.episodeDescription}>{rowData.description}</Text>
          </View>
        </TouchableHighlight>}>
      </ListView>
    );
  },
  componentDidMount: function() {
    fetch("https://www.eslpod.com/website/show_all.php?low_rec=0")
      .then((response) => {
        return response.text();
      })
      .then((responseText) => {
        var episodes = responseText.split('class="podcast_table_home">')
          .filter(episodeItemHtml => episodeItemHtml.indexOf('<span class="date-header">') != -1 && episodeItemHtml.indexOf('<span class="pod_body ">') != -1)
          .map(episodeItemHtml => {
            var episodeItem = {}
            episodeItem.date = StringUtils.innerText(episodeItemHtml, '<span class="date-header">', '</span>').trim();
            episodeItem.title = StringUtils.stripHtml(StringUtils.innerText(episodeItemHtml, 'class="podcast_title">', '</a>')).trim();
            episodeItem.soundURL = "http://" + StringUtils.innerText(episodeItemHtml, '<br><a href="http://', '.mp3"') + ".mp3";
            episodeItem.description = StringUtils.stripHtml(StringUtils.innerText(episodeItemHtml, '<!-- SHOW PODCAST BLURB -->', '<br>').trim().replace(/[\n\r]/g, ''));
            episodeItem.detailURL = "https://www.eslpod.com/website/" + StringUtils.innerText(episodeItemHtml, '<a href="', '"');
            episodeItem.tags = StringUtils.innerText(episodeItemHtml, 'Tags:', '</span>').split('</a>')
              .map(tagItemHtml => 
                StringUtils.stripHtml(tagItemHtml).replace(',', '').trim()
              )
              .filter(tagItemText => 
                tagItemText.length != 0
              );
            //console.log(episodeItem);

            return episodeItem;
          });

        return episodes;
      })
      .then((episodes) => {
        this.setState({
          dataSource: this.state.dataSource.cloneWithRows(episodes)
        });
      })
      .catch((error) => {
        console.warn(error);
      });
  },
  _viewEpisode: function(episode) {
    this.props.navigator.push({
    	component: EpisodeDetail,
    	title: episode.title,
    	passProps: {
    		episode: episode
    	}
    });
  },
});

var styles = StyleSheet.create({
  episodeList: {
    backgroundColor: '#ffffff'
  },
  episodeItemContainer: {
    padding: 10, 
    backgroundColor: '#ffffff', 
    borderBottomColor: 'lightgray', 
    borderTopColor: '#ffffff', 
    borderLeftColor: '#ffffff', 
    borderRightColor: '#ffffff', 
    borderWidth: 0.5
  },
  episodeTitle: {
    color: '#000000',
    fontWeight: 'bold',
  },
  episodeDescription: {
    color: '#333333',
  },
});

module.exports = EpisodeList;