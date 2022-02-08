zip:  {
 /**
  * Compress data.
  *
  * @syntax  CompressionLZW.compress(string);
  * @param   string
  * @return  Array   Returns an array of integers.
  */
 compress:function(input)
 {
  input = input.replace(/toString/g, "to$tring").replace(/valueOf/g, "value0f");
  var stringTable = {},
   outputBuffer = [],
   string = input.charAt(0),
   nextCode = 256,
   character,
   i = 1;  
  while(character = input.charAt(i++))
  {
   if(stringTable[string+character])
    string += character;
   else
   {
    outputBuffer.push(string.length == 1?string.charCodeAt(0):stringTable[string]);
    stringTable[string+character] = nextCode++;
    string = character;
   }
  }
  outputBuffer.push(string.length == 1?string.charCodeAt(0):stringTable[string]);
  return outputBuffer;
 },

 /**
  * Decompress data.
  *
  * @syntax  CompressionLZW.decompress(array);
  * @param   array    An array of integers.
  * @return  String
  */
 decompress:function(input)
 {
  var translationTable = [],
   outputBuffer = [],
   nextCode = 256,
   oldCode = String.fromCharCode(input[0]),
   character = oldCode,
   string,
   newCode;
  outputBuffer.push(oldCode);
  for(var i = 1; newCode = input[i]; i++)
  {
   string = newCode < 256 ? String.fromCharCode(newCode):
    translationTable[newCode] ? translationTable[newCode] : (oldCode + character);
   outputBuffer.push(string);
   character = string.charAt(0);
   translationTable[nextCode++] = oldCode + character;
   oldCode = string; 
  }
  return outputBuffer.join("").replace(/to\$tring/g, "toString").replace(/value0f/g, "valueOf");
 }
}
