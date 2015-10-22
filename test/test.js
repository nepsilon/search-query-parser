var assert = require('assert')
  , should = require('should')
  , searchquery = require('../');


describe('Search query syntax parser', function () {


  it('should return a simple string when zero keyword present', function () {
    var searchQuery = "fancy pyjama wear";
    var parsedSearchQuery = searchquery.parse(searchQuery);

    parsedSearchQuery.should.be.a.string;
    parsedSearchQuery.should.equal(searchQuery);
  });


  it('should parse a single keyword with no text', function () {
    var searchQuery = 'from:jul@foo.com';
    var options = {keywords: ['from']};
    var parsedSearchQuery = searchquery.parse(searchQuery, options);

    parsedSearchQuery.should.be.an.Object;
    parsedSearchQuery.should.have.property('from', 'jul@foo.com');
    parsedSearchQuery.should.not.have.property('text');
  });


  it('should parse a single keyword with free text after it', function () {
    var searchQuery = 'from:jul@foo.com hey buddy!';
    var options = {keywords: ['from']};
    var parsedSearchQuery = searchquery.parse(searchQuery, options);

    parsedSearchQuery.should.be.an.Object;
    parsedSearchQuery.should.have.property('from', 'jul@foo.com');
    parsedSearchQuery.should.have.property('text', 'hey buddy!');
  });


  it('should parse a single keyword with free text before it', function () {
    var searchQuery = 'hey you! from:jul@foo.com';
    var options = {keywords: ['from']};
    var parsedSearchQuery = searchquery.parse(searchQuery, options);

    parsedSearchQuery.should.be.an.Object;
    parsedSearchQuery.should.have.property('from', 'jul@foo.com');
    parsedSearchQuery.should.have.property('text', 'hey you!');
  });


  it('should parse a single keyword with free text around it', function () {
    var searchQuery = 'hey you! from:jul@foo.com pouet';
    var options = {keywords: ['from']};
    var parsedSearchQuery = searchquery.parse(searchQuery, options);

    parsedSearchQuery.should.be.an.Object;
    parsedSearchQuery.should.have.property('from', 'jul@foo.com');
    parsedSearchQuery.should.have.property('text', 'hey you! pouet');
  });


  it('should strip any white space at any position', function () {
    // We have tabs and regular spaces in the string below
    var searchQuery = '   hey     you! from:jul@foo.com   pouet ';
    var options = {keywords: ['from']};
    var parsedSearchQuery = searchquery.parse(searchQuery, options);

    parsedSearchQuery.should.be.an.Object;
    parsedSearchQuery.should.have.property('from', 'jul@foo.com');
    parsedSearchQuery.should.have.property('text', 'hey you! pouet');
  });


  it('should parse 2 different keywords with free text', function () {
    var searchQuery = 'hey, from:jul@foo.com to:bar@hey.ya so what\'s up gents';
    var options = {keywords: ['from', 'to']};
    var parsedSearchQuery = searchquery.parse(searchQuery, options);

    parsedSearchQuery.should.be.an.Object;
    parsedSearchQuery.should.have.property('from', 'jul@foo.com');
    parsedSearchQuery.should.have.property('to', 'bar@hey.ya');
    parsedSearchQuery.should.have.property('text', 'hey, so what\'s up gents');
  });


  it('should concatenate 2 identical keywords value and keep free text', function () {
    var searchQuery = 'from:jul@foo.com from:bar@hey.ya vaccationessss';
    var options = {keywords: ['from']};
    var parsedSearchQuery = searchquery.parse(searchQuery, options);

    parsedSearchQuery.should.be.an.Object;
    parsedSearchQuery.should.have.property('from');
    parsedSearchQuery.should.have.property('text', 'vaccationessss');
    parsedSearchQuery.from.should.be.an.Array;
    parsedSearchQuery.from.length.should.equal(2);
    parsedSearchQuery.from.should.containEql('jul@foo.com');
    parsedSearchQuery.from.should.containEql('bar@hey.ya');
  });


  it('should concatenate a keyword multiple values', function () {
    var searchQuery = 'from:jul@foo.com,bar@hey.ya';
    var options = {keywords: ['from']};
    var parsedSearchQuery = searchquery.parse(searchQuery, options);

    parsedSearchQuery.should.be.an.Object;
    parsedSearchQuery.should.have.property('from');
    parsedSearchQuery.from.should.be.an.Array;
    parsedSearchQuery.from.length.should.equal(2);
    parsedSearchQuery.from.should.containEql('jul@foo.com');
    parsedSearchQuery.from.should.containEql('bar@hey.ya');
  });


  it('should concatenate values from 2 identical keyword multiple values and keep free text', function () {
    var searchQuery = 'from:jul@foo.com,bar@hey.ya from:a@b.c,d@e.f ouch!#';
    var options = {keywords: ['from']};
    var parsedSearchQuery = searchquery.parse(searchQuery, options);

    parsedSearchQuery.should.be.an.Object;
    parsedSearchQuery.should.have.property('text', 'ouch!#');
    parsedSearchQuery.should.have.property('from');
    parsedSearchQuery.from.should.be.an.Array;
    parsedSearchQuery.from.length.should.equal(4);
    parsedSearchQuery.from.should.containEql('jul@foo.com');
    parsedSearchQuery.from.should.containEql('bar@hey.ya');
    parsedSearchQuery.from.should.containEql('a@b.c');
    parsedSearchQuery.from.should.containEql('d@e.f');
  });


  it('should parse range with only 1 end and free text', function () {
    var searchQuery = 'date:12/12/2012 ahaha';
    var options = {ranges: ['date']};
    var parsedSearchQuery = searchquery.parse(searchQuery, options);

    parsedSearchQuery.should.be.an.Object;
    parsedSearchQuery.should.have.property('text', 'ahaha');
    parsedSearchQuery.should.have.property('date');
    parsedSearchQuery.date.should.be.an.Object;
    parsedSearchQuery.date.from.should.containEql('12/12/2012');
  });

  it('should parse range with 2 ends and free text', function () {
    var searchQuery = 'date:12/12/2012-01/01/2014 ahaha';
    var options = {ranges: ['date']};
    var parsedSearchQuery = searchquery.parse(searchQuery, options);

    parsedSearchQuery.should.be.an.Object;
    parsedSearchQuery.should.have.property('text', 'ahaha');
    parsedSearchQuery.should.have.property('date');
    parsedSearchQuery.date.should.be.an.Object;
    parsedSearchQuery.date.from.should.containEql('12/12/2012');
    parsedSearchQuery.date.to.should.containEql('01/01/2014');
  });


  it('should be able to parse unicode', function () {
    var searchQuery = '✓ about 这个事儿';
    var parsedSearchQuery = searchquery.parse(searchQuery);

    parsedSearchQuery.should.be.a.string;
    parsedSearchQuery.should.be.equal('✓ about 这个事儿');
  });


  it('should be able to parse unicode with keywords and funny spacing', function () {
    var searchQuery = ' ✓  about    这个事儿      from:dr@who.co.uk  ';
    var options = {keywords: ['from']};
    var parsedSearchQuery = searchquery.parse(searchQuery, options);

    parsedSearchQuery.should.be.an.Object;
    parsedSearchQuery.should.have.property('text', '✓ about 这个事儿');
    parsedSearchQuery.should.have.property('from', 'dr@who.co.uk');
  });


  it('should handle absurdly complex and long query', function () {
    var searchQuery = '   date:12/12/2012-01/01/2014 ahaha from:jul@foo.com,bar@hey.ya from:a@b.c,d@e.f ouch!#   to:me@me.com to:toto@hey.co about that';
    var options = {ranges: ['date'], keywords: ['from', 'to']};
    var parsedSearchQuery = searchquery.parse(searchQuery, options);

    parsedSearchQuery.should.be.an.Object;
    parsedSearchQuery.should.have.property('text', 'ahaha ouch!# about that');
    parsedSearchQuery.should.have.property('date');
    parsedSearchQuery.date.should.be.an.Object;
    parsedSearchQuery.date.from.should.containEql('12/12/2012');
    parsedSearchQuery.date.to.should.containEql('01/01/2014');
    parsedSearchQuery.should.have.property('from');
    parsedSearchQuery.from.should.be.an.Array;
    parsedSearchQuery.from.length.should.equal(4);
    parsedSearchQuery.from.should.containEql('jul@foo.com');
    parsedSearchQuery.from.should.containEql('bar@hey.ya');
    parsedSearchQuery.from.should.containEql('a@b.c');
    parsedSearchQuery.from.should.containEql('d@e.f');
    parsedSearchQuery.should.have.property('to');
    parsedSearchQuery.to.should.be.an.Array;
    parsedSearchQuery.to.length.should.equal(2);
    parsedSearchQuery.to.should.containEql('me@me.com');
    parsedSearchQuery.to.should.containEql('toto@hey.co');
  });


  it('should not split on spaces inside single and double quotes', function () {
    var searchQuery = 'name:"Bob Saget" description:\'Banana Sandwiche\'';
    var options = {keywords: ['name', 'description']};
    var parsedSearchQuery = searchquery.parse(searchQuery, options);

    parsedSearchQuery.should.be.an.Object;
    parsedSearchQuery.should.have.property('name', 'Bob Saget');
    parsedSearchQuery.should.have.property('description', 'Banana Sandwiche');
  });


  it('should correctly handle escaped single and double quotes', function () {
    var searchQuery = 'case1:"This \\"is\\" \'a\' test" case2:\'This "is" \\\'a\\\' test\'';
    var options = {keywords: ['case1', 'case2']};
    var parsedSearchQuery = searchquery.parse(searchQuery, options);

    parsedSearchQuery.should.be.an.Object;
    parsedSearchQuery.should.have.property('case1', 'This "is" \'a\' test');
    parsedSearchQuery.should.have.property('case2', 'This "is" \'a\' test');
  });


});
