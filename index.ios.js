/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

var React = require('react-native');
var {
  AppRegistry,
  NavigatorIOS,
} = React;

var EpisodeList = require('./app/episode-list');

var Root = React.createClass({
  render: function() {
    return (
        <NavigatorIOS ref='nav' style={{flex: 1}} initialRoute={{component: EpisodeList,
          title: 'ESL Podcast',
        }}>
        </NavigatorIOS>
      );
  }
});

AppRegistry.registerComponent('EnglishPod', () => Root);
