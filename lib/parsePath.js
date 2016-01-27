module.exports = parsePath;

function parsePath( path ) {
  var options = {};
  if ( !path ) return options;
  var parts = path.split( '/' );

  var i = 0;
  while ( i < parts.length ) {
    switch ( parts[ i ] ) {
    case 'o':
      options.organization = parts[ i + 1 ];
      i += 2;
      break;
    case 'e':
      options.environment = parts[ i + 1 ];
      i += 2;
      break;
    case 'r':
      options.type = 'resource';
      options.resourceType = parts[ i + 1 ];
      options.resourceName = parts[ i + 2 ];
      i += 3;
      break;
    case 't':
      options.type = 'target';
      options.targetName = parts[ i + 1 ];
      i += 2;
      break;
    case '':
      // ignore empty
      ++i;
      break;
    default:
      throw new Error( 'Unexpected path segment ' + parts[ i ] );
    }
  }

  if ( options.resourceType && options.resourceType !== 'jsc' && options.resourceType !== 'node' ) {
    throw new Error( 'Invalid resource type ' + options.resourceType );
  }

  return options;
}
