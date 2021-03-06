/*
* @Author: lu
* @Date:   2016-06-11 14:09:30
* @Last Modified by:   han4wluc
* @Last Modified time: 2016-06-11 21:37:14
*/

import $ from 'jquery';
import './style.css';
import ProofReader from '../app/proofreader';

var entireContent = $('body').text();

// var getWrongWords = function(input){
//   return ['教育', '购了', '中自'];
// }

// var replace = function(inputText, replaceWord){
//   var regex = new RegExp(replaceWord, 'g');
//   // var replaceResult = '<span class="error-underline">' + replaceWord + '<span class="tooltiptext">Grammar Error</span>' + '</span>';
//   var replaceResult = '<span class="error-underline">' + replaceWord + '</span>';
//   return inputText.replace(replaceWord, replaceResult);
// }

var paragraphs = {};
var hashes = {};

function recursiveReplace(node) {

  if (node.nodeType == 3 && node.nodeValue.trim().length > 2) { // text node

    var paragraph = node.nodeValue.trim();

    var hash = 'h' + (Math.random()+'').substring(2);

    paragraphs[hash] = paragraph;
    hashes[hash] = paragraph;


    $(node).parent().addClass(hash);


  } else if (node.nodeType == 1) { // element
    try {
      $(node).contents().each(function () {
          recursiveReplace(this);
      });
    } catch(error) {
      console.log(error);
    }

  }
}

recursiveReplace(document.body);

// var expected = analyzeWrongWords(hashes);
// console.log('hashes', hashes)
var pr = new ProofReader();
var expected = pr.proofread(hashes);

console.log('expected', expected);

var joinWordsAndPunc = function(words, mixedPunctuations){

  var combinedObjects = words.concat(mixedPunctuations);

  var uniqueCombinedObjectes = [];

  combinedObjects.forEach(function(wrongObj){
    var hashes = uniqueCombinedObjectes.map(function(object){
      return object.hash;
    })
    var index = hashes.indexOf(wrongObj.hash);
    if(index === -1){
      uniqueCombinedObjectes.push(wrongObj);
    } else {
      uniqueCombinedObjectes[index].words = uniqueCombinedObjectes[index].words.concat(wrongObj.words);
    }
  });

  // console.log('combined', uniqueCombinedObjectes);
  return uniqueCombinedObjectes;
}

var wrongWordsObj = joinWordsAndPunc(expected.words, expected.mixedPunctuation);

wrongWordsObj.forEach(function(wordObj){

  var node = $('.'+wordObj.hash);
  console.log('wrongWordsObj');
  console.log(wordObj);
  // if(_.isEmpty(wrongWords)){
  //   return;
  // }
  var wrongWords = wordObj.words.map(function(word){
    return word.word;
  });

//TODO better escape
  function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  }

  $(node).contents().each(function(){
    if(this.nodeType === 3){
      var regex = new RegExp('(' +  wrongWords.map(s=>escapeRegExp(s)).join('|') + ')', 'g');
      var oldHtml = $(this).text();
      var newHtml = oldHtml.replace(regex, '<span class="error-underline">$1<span class="tooltiptext">Grammar Error</span></span>');
      $(this).replaceWith(newHtml);
    }
  })
})
