import { BaseEntity } from "../base.entity";

describe("base entity", () => {
  it("should initialise a subclass instance with undefined properties before persistence", () => {
    // given
    class TestEntity extends BaseEntity {}

    // when
    const entity = new TestEntity();

    // then
    expect(entity.id).toBeUndefined();
    expect(entity.createdAt).toBeUndefined();
    expect(entity.updatedAt).toBeUndefined();
  });
});
