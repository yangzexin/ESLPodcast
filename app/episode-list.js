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

var LOAD_NEXT_PAGE_HOLDER = 'LoadNextPageHolder';

var EpisodeList = React.createClass({
  getInitialState: function() {
    return {
      episodes: [],
      pageIndex: 0,
      loading: false,
      dataSource: new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}),
    };
  },
  render: function() {
    console.log('rendering:' + this.state.loading);
    return (
      <ListView style={styles.episodeList} dataSource={this.state.dataSource} renderRow={(rowData) => 
        <TouchableHighlight underlayColor='#3b3b3b' onPress={this._viewEpisode.bind(this, rowData)}>
          <View style={styles.episodeItemContainer}>
            {rowData == LOAD_NEXT_PAGE_HOLDER ? <Text style={styles.loadNextPageHolder}>{this.state.loading ? 'Loading..' : 'Show More..'}</Text> 
              : <View>
                  <Text style={styles.episodeTitle}>{rowData.title}</Text>
                  <Text style={styles.episodeDescription}>{rowData.description}</Text>
                  </View>
            }
          </View>
        </TouchableHighlight>}>
      </ListView>
    );
  },
  componentDidMount: function() {
    this._fetchNextPage();
  },
  _fetchNextPage: function() {
    var state = this.state;
    state.loading = true;
    this.setState(state);

    fetch("https://www.eslpod.com/website/show_all.php?low_rec=" + this.state.pageIndex * 20)
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
        var existsEpisodes = this.state.episodes || [];
        existsEpisodes = existsEpisodes.concat(episodes);
        this.setState({
          pageIndex: this.state.pageIndex + 1,
          episodes: existsEpisodes,
          loading: false,
          dataSource: this.state.dataSource.cloneWithRows(existsEpisodes.length == 0 ? [] : [...existsEpisodes, LOAD_NEXT_PAGE_HOLDER]),
        });
      })
      .catch((error) => {
        console.warn(error);
      });
  },
  _viewEpisode: function(episode) {
    if (episode == LOAD_NEXT_PAGE_HOLDER) {
      this._fetchNextPage();
    } else {
      this.props.navigator.push({
        component: EpisodeDetail,
        title: episode.title,
        passProps: {
          episode: episode
        }
      });
    }
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
  loadNextPageHolder: {
    fontWeight: 'bold',
    height: 45,
    lineHeight: 30,
    textAlign: 'center',
    fontSize: 16,
  }
});

module.exports = EpisodeList;