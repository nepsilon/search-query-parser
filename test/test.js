var assert = require('assert')
  , searchquery = require('search-query');


describe('Search query parser', function () {

  it('should return a simple string when zero keyword present', function () {
    var searchQuery = "fancy pyjama wear";
    var parsedSearchQuery = searchquery.parse(searchQuery);
    parsedSearchQuery.should.be.a.string;
    parsedSearchQuery.should.equal(searchQuery);
  });

});
