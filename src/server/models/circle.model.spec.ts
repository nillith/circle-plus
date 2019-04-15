import {assert} from 'chai';
import {CircleModel, CirclePacker} from "./circle.model";
import {makeInstance} from "../../shared/utils";
import {isValidObfuscatedIdFormat} from "../service/obfuscator.service";

describe('CircleModel', () => {
  it('should return instance of CirclePacker', async () => {
    const pack = await CircleModel.getAllCircleForUser(1);
    assert.instanceOf(pack, CirclePacker);
  });

  it('should obfuscate id', () => {
    const data = {
      circles: [
        {
          id: 1,
          name: 'oeu',
          users: [
            {
              id: 1,
              nickname: 'natoeu',
              avatarUrl: 'aoeutauoe'
            },
            {
              id: 2,
              nickname: 'natoeu',
              avatarUrl: 'aoeutauoe'
            }
          ]
        },
        {
          id: 2,
          name: 'oeu',
          users: [
            {
              id: 1,
              nickname: 'natoeu',
              avatarUrl: 'aoeutauoe'
            },
            {
              id: 2,
              nickname: 'natoeu',
              avatarUrl: 'aoeutauoe'
            }
          ]
        }
      ]
    };
    makeInstance(data, CirclePacker);

    const clone = JSON.parse(JSON.stringify({
      circles: data
    }));

    const {circles} = clone;

    assert.isArray(circles);
    assert.isAtLeast(circles.length, 1);
    assert.strictEqual(circles.length, data.circles.length);

    for (const c of circles) {
      assert.isTrue(isValidObfuscatedIdFormat(c.id));
      for (const u of c.users) {
        assert.isTrue(isValidObfuscatedIdFormat(u.id));
      }
    }
  });
});