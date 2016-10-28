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
    parsedSearchQuery.should.have.property('offsets', [{
      keyword: 'from',
      value: 'jul@foo.com',
      offsetStart: 0,
      offsetEnd: 16
    }]);
  });


  it('should parse a single keyword with free text after it', function () {
    var searchQuery = 'from:jul@foo.com hey buddy!';
    var options = {keywords: ['from']};
    var parsedSearchQuery = searchquery.parse(searchQuery, options);

    parsedSearchQuery.should.be.an.Object;
    parsedSearchQuery.should.have.property('from', 'jul@foo.com');
    parsedSearchQuery.should.have.property('text', 'hey buddy!');
    parsedSearchQuery.should.have.property('offsets', [{
      keyword: 'from',
      value: 'jul@foo.com',
      offsetStart: 0,
      offsetEnd: 16
    }, {
      text: 'hey',
      offsetStart: 17,
      offsetEnd: 20
    }, {
      text: 'buddy!',
      offsetStart: 21,
      offsetEnd: 27
    }]);
  });


  it('should ignore keywords that are not specified', function() {
    var searchQuery = 'test another other:jul@foo.com';
    var options = {
      keywords: ['from']
    };
    var parsedSearchQuery = searchquery.parse(searchQuery, options);

    parsedSearchQuery.should.be.an.Object;
    parsedSearchQuery.should.have.not.have.property('other');
    parsedSearchQuery.should.have.property('text', 'test another other:jul@foo.com');
    parsedSearchQuery.should.have.property('offsets', [{
      text: 'test',
      offsetStart: 0,
      offsetEnd: 4
    }, {
      text: 'another',
      offsetStart: 5,
      offsetEnd: 12
    }, {
      text: 'other:jul@foo.com',
      offsetStart: 13,
      offsetEnd: 30
    }]);
  });


  it('should parse a single keyword with free text before it', function() {
    var searchQuery = 'hey you! from:jul@foo.com';
    var options = {keywords: ['from']};
    var parsedSearchQuery = searchquery.parse(searchQuery, options);

    parsedSearchQuery.should.be.an.Object;
    parsedSearchQuery.should.have.property('from', 'jul@foo.com');
    parsedSearchQuery.should.have.property('text', 'hey you!');
    parsedSearchQuery.should.have.property('offsets', [{
      text: 'hey',
      offsetStart: 0,
      offsetEnd: 3
    }, {
      text: 'you!',
      offsetStart: 4,
      offsetEnd: 8
    }, {
      keyword: 'from',
      value: 'jul@foo.com',
      offsetStart: 9,
      offsetEnd: 25
    }]);
  });


  it('should parse a single keyword with free text around it', function () {
    var searchQuery = 'hey you! from:jul@foo.com pouet';
    var options = {keywords: ['from']};
    var parsedSearchQuery = searchquery.parse(searchQuery, options);

    parsedSearchQuery.should.be.an.Object;
    parsedSearchQuery.should.have.property('from', 'jul@foo.com');
    parsedSearchQuery.should.have.property('text', 'hey you! pouet');
    parsedSearchQuery.should.have.property('offsets', [{
      text: 'hey',
      offsetStart: 0,
      offsetEnd: 3
    }, {
      text: 'you!',
      offsetStart: 4,
      offsetEnd: 8
    }, {
      keyword: 'from',
      value: 'jul@foo.com',
      offsetStart: 9,
      offsetEnd: 25
    }, {
      text: 'pouet',
      offsetStart: 26,
      offsetEnd: 31
    }]);
  });


  it('should strip any white space at any position', function () {
    // We have tabs and regular spaces in the string below
    var searchQuery = '   hey     you! from:jul@foo.com   pouet ';
    var options = {keywords: ['from']};
    var parsedSearchQuery = searchquery.parse(searchQuery, options);

    parsedSearchQuery.should.be.an.Object;
    parsedSearchQuery.should.have.property('from', 'jul@foo.com');
    parsedSearchQuery.should.have.property('text', 'hey you! pouet');
    parsedSearchQuery.should.have.property('offsets', [{
      text: 'hey',
      offsetStart: 3,
      offsetEnd: 6
    }, {
      text: 'you!',
      offsetStart: 11,
      offsetEnd: 15
    }, {
      keyword: 'from',
      value: 'jul@foo.com',
      offsetStart: 16,
      offsetEnd: 32
    }, {
      text: 'pouet',
      offsetStart: 35,
      offsetEnd: 40
    }]);
  });


  it('should parse 2 different keywords with free text', function () {
    var searchQuery = 'hey, from:jul@foo.com to:bar@hey.ya so what\'s up gents';
    var options = {keywords: ['from', 'to']};
    var parsedSearchQuery = searchquery.parse(searchQuery, options);

    parsedSearchQuery.should.be.an.Object;
    parsedSearchQuery.should.have.property('from', 'jul@foo.com');
    parsedSearchQuery.should.have.property('to', 'bar@hey.ya');
    parsedSearchQuery.should.have.property('text', 'hey, so what\'s up gents');
    parsedSearchQuery.should.have.property('offsets', [{
      text: 'hey,',
      offsetStart: 0,
      offsetEnd: 4
    }, {
      keyword: 'from',
      value: 'jul@foo.com',
      offsetStart: 5,
      offsetEnd: 21
    }, {
      keyword: 'to',
      value: 'bar@hey.ya',
      offsetStart: 22,
      offsetEnd: 35
    }, {
      text: 'so',
      offsetStart: 36,
      offsetEnd: 38
    }, {
      text: 'what\'s',
      offsetStart: 39,
      offsetEnd: 45
    }, {
      text: 'up',
      offsetStart: 46,
      offsetEnd: 48
    }, {
      text: 'gents',
      offsetStart: 49,
      offsetEnd: 54
    }]);
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
    parsedSearchQuery.should.have.property('offsets', [{
      keyword: 'from',
      value: 'jul@foo.com',
      offsetStart: 0,
      offsetEnd: 16
    }, {
      keyword: 'from',
      value: 'bar@hey.ya',
      offsetStart: 17,
      offsetEnd: 32
    }, {
      text: 'vaccationessss',
      offsetStart: 33,
      offsetEnd: 47
    }]);
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
    parsedSearchQuery.should.have.property('offsets', [{
      keyword: 'from',
      value: 'jul@foo.com,bar@hey.ya',
      offsetStart: 0,
      offsetEnd: 27
    }]);
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
    parsedSearchQuery.should.have.property('offsets', [{
      keyword: 'from',
      value: 'jul@foo.com,bar@hey.ya',
      offsetStart: 0,
      offsetEnd: 27
    }, {
      keyword: 'from',
      value: 'a@b.c,d@e.f',
      offsetStart: 28,
      offsetEnd: 44
    }, {
      text: 'ouch!#',
      offsetStart: 45,
      offsetEnd: 51
    }]);
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
    parsedSearchQuery.should.have.property('offsets', [{
      keyword: 'date',
      value: '12/12/2012',
      offsetStart: 0,
      offsetEnd: 15
    }, {
      text: 'ahaha',
      offsetStart: 16,
      offsetEnd: 21
    }]);
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
    parsedSearchQuery.should.have.property('offsets', [{
      keyword: 'date',
      value: '12/12/2012-01/01/2014',
      offsetStart: 0,
      offsetEnd: 26
    }, {
      text: 'ahaha',
      offsetStart: 27,
      offsetEnd: 32
    }]);
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
    parsedSearchQuery.should.have.property('offsets', [{
      keyword: 'date',
      value: '12/12/2012-01/01/2014',
      offsetStart: 3,
      offsetEnd: 29
    }, {
      text: 'ahaha',
      offsetStart: 30,
      offsetEnd: 35
    }, {
      keyword: 'from',
      value: 'jul@foo.com,bar@hey.ya',
      offsetStart: 36,
      offsetEnd: 63
    }, {
      keyword: 'from',
      value: 'a@b.c,d@e.f',
      offsetStart: 64,
      offsetEnd: 80
    }, {
      text: 'ouch!#',
      offsetStart: 81,
      offsetEnd: 87
    }, {
      keyword: 'to',
      value: 'me@me.com',
      offsetStart: 90,
      offsetEnd: 102
    }, {
      keyword: 'to',
      value: 'toto@hey.co',
      offsetStart: 103,
      offsetEnd: 117
    }, {
      text: 'about',
      offsetStart: 118,
      offsetEnd: 123
    }, {
      text: 'that',
      offsetStart: 124,
      offsetEnd: 128
    }]);
  });


  it('should not split on spaces inside single and double quotes', function () {
    var searchQuery = 'name:"Bob Saget" description:\'Banana Sandwiche\'';
    var options = {keywords: ['name', 'description']};
    var parsedSearchQuery = searchquery.parse(searchQuery, options);

    parsedSearchQuery.should.be.an.Object;
    parsedSearchQuery.should.have.property('name', 'Bob Saget');
    parsedSearchQuery.should.have.property('description', 'Banana Sandwiche');
    parsedSearchQuery.should.have.property('offsets', [{
      keyword: 'name',
      value: 'Bob Saget',
      offsetStart: 0,
      offsetEnd: 16
    }, {
      keyword: 'description',
      value: 'Banana Sandwiche',
      offsetStart: 17,
      offsetEnd: 47
    }]);
  });


  it('should correctly handle escaped single and double quotes', function () {
    var searchQuery = 'case1:"This \\"is\\" \'a\' test" case2:\'This "is" \\\'a\\\' test\'';
    var options = {keywords: ['case1', 'case2']};
    var parsedSearchQuery = searchquery.parse(searchQuery, options);

    parsedSearchQuery.should.be.an.Object;
    parsedSearchQuery.should.have.property('case1', 'This "is" \'a\' test');
    parsedSearchQuery.should.have.property('case2', 'This "is" \'a\' test');
    parsedSearchQuery.should.have.property('offsets', [{
      keyword: 'case1',
      value: 'This "is" \'a\' test',
      offsetStart: 0,
      offsetEnd: 28
    }, {
      keyword: 'case2',
      value: 'This "is" \'a\' test',
      offsetStart: 29,
      offsetEnd: 57
    }]);
  });


  it('should parse a single keyword query in exclusion syntax', function() {
    var searchQuery = '-from:jul@foo.com';
    var options = {keywords: ['from']};
    var parsedSearchQuery = searchquery.parse(searchQuery, options);

    parsedSearchQuery.should.be.an.Object;
    parsedSearchQuery.exclude.should.be.an.Object;
    parsedSearchQuery.exclude.should.have.property('from', 'jul@foo.com');
    parsedSearchQuery.should.not.have.property('text');
    parsedSearchQuery.should.have.property('offsets', [{
      keyword: 'from',
      value: 'jul@foo.com',
      offsetStart: 1,
      offsetEnd: 17
    }]);
  });

  it('should concatenate a keyword multiple values in exclusion syntax', function() {
    var searchQuery = '-from:jul@foo.com,mar@foo.com';
    var options = {keywords: ['from']};
    var parsedSearchQuery = searchquery.parse(searchQuery, options);

    parsedSearchQuery.should.be.an.Object;
    parsedSearchQuery.exclude.should.be.an.Object;
    parsedSearchQuery.exclude.from.should.containEql('jul@foo.com');
    parsedSearchQuery.exclude.from.should.containEql('mar@foo.com');
    parsedSearchQuery.should.not.have.property('text');
    parsedSearchQuery.should.have.property('offsets', [{
      keyword: 'from',
      value: 'jul@foo.com,mar@foo.com',
      offsetStart: 1,
      offsetEnd: 29
    }]);
  });

  it('should support keywords which appear multiple times with exclusion syntax', function() {
    var searchQuery = '-from:jul@foo.com,mar@foo.com -from:jan@foo.com';
    var options = {
      keywords: ['from']
    };
    var parsedSearchQuery = searchquery.parse(searchQuery, options);

    parsedSearchQuery.should.be.an.Object;
    parsedSearchQuery.exclude.should.be.an.Object;
    parsedSearchQuery.exclude.from.should.containEql('jul@foo.com');
    parsedSearchQuery.exclude.from.should.containEql('mar@foo.com');
    parsedSearchQuery.exclude.from.should.containEql('jan@foo.com');
    parsedSearchQuery.should.not.have.property('text');
    parsedSearchQuery.should.have.property('offsets', [{
      keyword: 'from',
      value: 'jul@foo.com,mar@foo.com',
      offsetStart: 1,
      offsetEnd: 29
    }, {
      keyword: 'from',
      value: 'jan@foo.com',
      offsetStart: 31,
      offsetEnd: 47
    }]);
  });
});