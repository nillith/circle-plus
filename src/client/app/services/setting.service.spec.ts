import {TestBed} from '@angular/core/testing';
import {SettingService} from './setting.service';
import {SharedTestingModule} from "../shared/shared-testing.module.spec";

describe('SettingService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [SharedTestingModule]
  }));

  it('should be created', () => {
    const service: SettingService = TestBed.get(SettingService);
    expect(service).toBeTruthy();
  });
});