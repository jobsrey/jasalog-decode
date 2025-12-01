import assert from 'assert';
import AISDecoder, { decode, decodeMultiple } from '../index.js';

/**
 * Test Suite for AIS Decoder Library
 */

// Test data - Real AIS NMEA sentences
const testData = {
  // Type 1: Position Report Class A
  type1: '!AIVDM,1,1,,B,15M67FC000G?ufbE`FepT@3n00Sa,0*5C',
  
  // Type 4: Base Station Report
  type4: '!AIVDM,1,1,,B,402OviQuMGCqWrRO9>E6fE700@GO,0*4D',
  
  // Type 5: Static and Voyage Related Data
  type5: '!AIVDM,2,1,3,B,55?MbV02>H;s<HtKR20EHE:0@T4@Dn2222222216L961O5Gf0NSQEp6ClRp8,0*1C',
  type5_part2: '!AIVDM,2,2,3,B,88888888880,2*25',
  
  // Type 18: Position Report Class B
  type18: '!AIVDM,1,1,,B,B52K;h02Kfq@OpBlNhWAwwpUkP06,0*76',
  
  // Type 19: Extended Class B Position Report
  type19: '!AIVDM,1,1,,B,C5N3SRP5HEJ:V00000000000000,0*1B',
  
  // Type 24: Static Data Report
  type24: '!AIVDM,1,1,,B,@03OviPUMGCqWrRO9>E6fE700@GO,0*3E',
};

/**
 * Test 1: Instantiation
 */
function testInstantiation() {
  console.log('Test 1: Instantiation');
  const decoder = new AISDecoder();
  assert(decoder instanceof AISDecoder, 'Should create AISDecoder instance');
  assert(decoder.multilineBuffer !== undefined, 'Should have multilineBuffer property');
  console.log('✓ Instantiation test passed\n');
}

/**
 * Test 2: Single line message decoding
 */
function testSingleLineDecoding() {
  console.log('Test 2: Single Line Message Decoding');
  const decoder = new AISDecoder();
  
  // Test Type 1 message
  const result = decoder.decode(testData.type1);
  assert(result !== null, 'Should return a result');
  assert(typeof result === 'object', 'Result should be an object');
  console.log('Type 1 decoded:', result);
  console.log('✓ Single line decoding test passed\n');
}

/**
 * Test 3: Convenience decode function
 */
function testConvenienceDecode() {
  console.log('Test 3: Convenience decode() Function');
  const result = decode(testData.type1);
  assert(result !== null, 'Should return a result');
  assert(typeof result === 'object', 'Result should be an object');
  console.log('✓ Convenience decode function test passed\n');
}

/**
 * Test 4: Decode multiple messages
 */
function testDecodeMultiple() {
  console.log('Test 4: Decode Multiple Messages');
  const sentences = [testData.type1, testData.type18];
  const results = decodeMultiple(sentences);
  
  assert(Array.isArray(results), 'Should return an array');
  assert(results.length === 2, 'Should decode 2 messages');
  assert(results[0] !== null, 'First message should be decoded');
  assert(results[1] !== null, 'Second message should be decoded');
  console.log('✓ Decode multiple messages test passed\n');
}

/**
 * Test 5: Error handling - Invalid sentence
 */
function testErrorHandling() {
  console.log('Test 5: Error Handling');
  const decoder = new AISDecoder();
  
  // Test with invalid sentence
  const result = decoder.decode('invalid');
  assert(result.error === true, 'Should return error for invalid input');
  assert(result.message !== undefined, 'Should have error message');
  console.log('Error handling result:', result);
  console.log('✓ Error handling test passed\n');
}

/**
 * Test 6: Multiline buffer initialization
 */
function testMultilineBufferInit() {
  console.log('Test 6: Multiline Buffer Initialization');
  const decoder = new AISDecoder();
  
  // Decode first part of Type 5 message
  const result1 = decoder.decode(testData.type5);
  assert(result1.partial === true, 'First part should be marked as partial');
  assert(result1.received === 1, 'Should have received 1 fragment');
  assert(result1.expected === 2, 'Should expect 2 fragments');
  console.log('✓ Multiline buffer initialization test passed\n');
}

/**
 * Test 7: Multiline message completion
 */
function testMultilineCompletion() {
  console.log('Test 7: Multiline Message Completion');
  const decoder = new AISDecoder();
  
  // Decode both parts of Type 5 message
  const result1 = decoder.decode(testData.type5);
  assert(result1.partial === true, 'First part should be partial');
  
  const result2 = decoder.decode(testData.type5_part2);
  assert(result2.partial !== true, 'Second part should complete the message');
  console.log('Completed message:', result2);
  console.log('✓ Multiline message completion test passed\n');
}

/**
 * Test 8: Buffer status
 */
function testBufferStatus() {
  console.log('Test 8: Buffer Status');
  const decoder = new AISDecoder();
  
  // Decode first part of multiline message
  decoder.decode(testData.type5);
  
  const status = decoder.getBufferStatus();
  assert(typeof status === 'object', 'Should return status object');
  console.log('Buffer status:', status);
  console.log('✓ Buffer status test passed\n');
}

/**
 * Test 9: Clear buffer
 */
function testClearBuffer() {
  console.log('Test 9: Clear Buffer');
  const decoder = new AISDecoder();
  
  // Add a message to buffer
  decoder.decode(testData.type5);
  let status = decoder.getBufferStatus();
  assert(Object.keys(status).length > 0, 'Buffer should have entries');
  
  // Clear all
  decoder.clearBuffer();
  status = decoder.getBufferStatus();
  assert(Object.keys(status).length === 0, 'Buffer should be empty after clear');
  console.log('✓ Clear buffer test passed\n');
}

/**
 * Test 10: Clear specific message ID
 */
function testClearSpecificMessageId() {
  console.log('Test 10: Clear Specific Message ID');
  const decoder = new AISDecoder();
  
  // Add a message to buffer
  const result = decoder.decode(testData.type5);
  const messageId = result.messageId;
  
  // Clear specific message ID
  decoder.clearBuffer(messageId);
  const status = decoder.getBufferStatus();
  assert(status[messageId] === undefined, 'Specific message should be cleared');
  console.log('✓ Clear specific message ID test passed\n');
}

/**
 * Test 11: Raw payload decoding
 */
function testRawPayloadDecoding() {
  console.log('Test 11: Raw Payload Decoding');
  const decoder = new AISDecoder();
  
  // Extract payload from NMEA sentence
  const nmea = testData.type1;
  const payload = nmea.split(',')[5].split('*')[0];
  
  // Decode raw payload
  const result = decoder.decode(payload);
  assert(result !== null, 'Should decode raw payload');
  assert(typeof result === 'object', 'Result should be an object');
  console.log('✓ Raw payload decoding test passed\n');
}

/**
 * Test 12: Message type identification
 */
function testMessageTypeIdentification() {
  console.log('Test 12: Message Type Identification');
  const decoder = new AISDecoder();
  
  const result = decoder.decode(testData.type1);
  assert(result.type !== undefined, 'Should have type property');
  assert(typeof result.type === 'number', 'Type should be a number');
  console.log('Message type:', result.type);
  console.log('✓ Message type identification test passed\n');
}

/**
 * Test 13: MMSI extraction
 */
function testMMSIExtraction() {
  console.log('Test 13: MMSI Extraction');
  const decoder = new AISDecoder();
  
  const result = decoder.decode(testData.type1);
  assert(result.mmsi !== undefined, 'Should have MMSI property');
  assert(typeof result.mmsi === 'number', 'MMSI should be a number');
  console.log('MMSI:', result.mmsi);
  console.log('✓ MMSI extraction test passed\n');
}

/**
 * Test 14: Unsupported message type
 */
function testUnsupportedMessageType() {
  console.log('Test 14: Unsupported Message Type');
  const decoder = new AISDecoder();
  
  // Create a payload for unsupported type (e.g., type 16)
  // This is a simplified test - actual implementation may vary
  const result = decoder.decodeByType(16, '0100000000000000000000000000000000000000000000000000000000000000');
  assert(result.error === true, 'Should return error for unsupported type');
  assert(result.message.includes('Unsupported'), 'Should have unsupported message');
  console.log('✓ Unsupported message type test passed\n');
}

/**
 * Test 15: Multiple instances independence
 */
function testMultipleInstancesIndependence() {
  console.log('Test 15: Multiple Instances Independence');
  const decoder1 = new AISDecoder();
  const decoder2 = new AISDecoder();
  
  // Add message to first decoder
  decoder1.decode(testData.type5);
  
  // Check that second decoder is unaffected
  const status1 = decoder1.getBufferStatus();
  const status2 = decoder2.getBufferStatus();
  
  assert(Object.keys(status1).length > 0, 'First decoder should have buffer entries');
  assert(Object.keys(status2).length === 0, 'Second decoder should have empty buffer');
  console.log('✓ Multiple instances independence test passed\n');
}

/**
 * Run all tests
 */
function runAllTests() {
  console.log('========================================');
  console.log('AIS Decoder Library - Test Suite');
  console.log('========================================\n');
  
  try {
    testInstantiation();
    testSingleLineDecoding();
    testConvenienceDecode();
    testDecodeMultiple();
    testErrorHandling();
    testMultilineBufferInit();
    testMultilineCompletion();
    testBufferStatus();
    testClearBuffer();
    testClearSpecificMessageId();
    testRawPayloadDecoding();
    testMessageTypeIdentification();
    testMMSIExtraction();
    testUnsupportedMessageType();
    testMultipleInstancesIndependence();
    
    console.log('========================================');
    console.log('✓ All tests passed!');
    console.log('========================================');
  } catch (error) {
    console.error('\n✗ Test failed:');
    console.error(error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run tests
runAllTests();
