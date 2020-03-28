# AC.js

`AC.js` is a simple utility designed to streamline common tasks in JavaScript. It’s built to be a simple tool when a larger JavaScript library or framework is not needed.

## Documentation

While `AC.js` does not provide documentation, it’s a very simple utility and can be learned very quickly. Here is an example of some of its usage:

```js
AC.ready(function() {
	var limit = AC.rateLimit(function() {
		console.log('Will be called once every 500ms when scrolling');
	}, 500);
	
	AC.wrap(window).on('scroll', limit, AC.PASSIVE_PARAM); 	
});
```

## License

`AC.js` can be used freely for any open source or commercial works and is released under a [MIT license](http://en.wikipedia.org/wiki/MIT_License).


## Author

[Aaron Clinger](http://aaronclinger.com)
