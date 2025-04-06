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
  
  test.each([
    { 
      frequency: CheckFrequency.MORNING, 
      currentDate: new Date(2025, 3, 5, 7, 30, 0), // 7:30 AM
      targetDate: new Date(2025, 3, 5, 8, 0, 0),   // 8:00 AM same day
      description: '8 AM today if current time is before 8 AM for MORNING frequency'
    },
    { 
      frequency: CheckFrequency.MORNING, 
      currentDate: new Date(2025, 3, 5, 9, 0, 0),  // 9:00 AM
      targetDate: new Date(2025, 3, 6, 8, 0, 0),   // 8:00 AM next day
      description: '8 AM tomorrow if current time is after 8 AM for MORNING frequency'
    },
    { 
      frequency: CheckFrequency.EVENING, 
      currentDate: new Date(2025, 3, 5, 19, 0, 0), // 7:00 PM
      targetDate: new Date(2025, 3, 5, 20, 0, 0),  // 8:00 PM same day
      description: '8 PM today if current time is before 8 PM for EVENING frequency'
    },
    { 
      frequency: CheckFrequency.EVENING, 
      currentDate: new Date(2025, 3, 5, 21, 0, 0), // 9:00 PM
      targetDate: new Date(2025, 3, 6, 20, 0, 0),  // 8:00 PM next day
      description: '8 PM tomorrow if current time is after 8 PM for EVENING frequency'
    },
    { 
      frequency: CheckFrequency.MIDNIGHT, 
      currentDate: new Date(2025, 3, 5, 15, 0, 0), // 3:00 PM
      targetDate: new Date(2025, 3, 6, 0, 0, 0),   // Midnight next day
      description: 'midnight of the next day for MIDNIGHT frequency'
    }
  ])('should schedule for $description', ({ frequency, currentDate, targetDate }) => {
    // given
    const MockDate = class extends Date {
      constructor() {
        super(currentDate);
      }
    } as DateConstructor;
    
    global.Date = MockDate;
    // Also mock Date.now() to return our fixed time
    jest.spyOn(Date, 'now').mockReturnValue(currentDate.getTime());
    
    // when
    const result = calculateNextCheckDelay(frequency);
    
    // then
    const expectedDelay = targetDate.getTime() - currentDate.getTime();
    expect(result).toBe(expectedDelay);
  });
});