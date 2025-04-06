import { CheckFrequency } from "../../../feature/alert/model/enum/checkFrequency.enum";
import { calculateNextCheckDelay } from "../calculateNextCheckDelay";

describe('calculateNextCheckDelay', () => {
  let originalDate: DateConstructor;
  
  beforeEach(() => {
    originalDate = global.Date;
  });
  
  afterEach(() => {
    global.Date = originalDate;
    jest.clearAllMocks();
  });
  
  test.each([
    { frequency: CheckFrequency.TEST, expectedDelay: 2 * 60 * 1000, description: '2 minutes for TEST frequency' },
    { frequency: CheckFrequency.HOURLY, expectedDelay: 60 * 60 * 1000, description: '1 hour for HOURLY frequency' },
    { frequency: CheckFrequency.DAILY, expectedDelay: 24 * 60 * 60 * 1000, description: '24 hours for DAILY frequency' },
    { frequency: 'UNKNOWN' as CheckFrequency, expectedDelay: 24 * 60 * 60 * 1000, description: 'default (24 hours) for unknown frequency' }
  ])('should return $description', ({ frequency, expectedDelay }) => {
    // given / when
    const result = calculateNextCheckDelay(frequency);
    
    // then
    expect(result).toBe(expectedDelay);
  });
});