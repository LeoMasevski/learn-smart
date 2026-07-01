/**
 * Factory for a chainable Supabase query builder mock.
 * Supports both terminal methods (.single(), .maybeSingle()) and direct await.
 */
export function makeBuilder(result: { data?: any; error?: any } = {}) {
  const resolved = { data: result.data ?? null, error: result.error ?? null };

  const builder: any = {
    // thenable so `await supabaseAdmin.from('x').select().eq(...)` works without .single()
    then: (resolve: (v: any) => any, reject?: (r: any) => any) => {
      const p = Promise.resolve(resolved);
      return reject ? p.then(resolve, reject) : p.then(resolve);
    },
  };

  const chainMethods = [
    "select", "insert", "update", "delete", "upsert",
    "eq", "neq", "in", "not", "order", "limit", "filter", "match",
  ];
  chainMethods.forEach((m) => {
    builder[m] = jest.fn().mockReturnValue(builder);
  });

  builder.single = jest.fn().mockResolvedValue(resolved);
  builder.maybeSingle = jest.fn().mockResolvedValue(resolved);

  return builder;
}

/**
 * Creates a mock for supabaseAdmin.from that returns different builders
 * per table name, or a default builder for unspecified tables.
 */
export function makeFromMock(tableBuilders: Record<string, ReturnType<typeof makeBuilder>>, fallback?: ReturnType<typeof makeBuilder>) {
  return jest.fn().mockImplementation((table: string) => {
    return tableBuilders[table] ?? fallback ?? makeBuilder();
  });
}

/**
 * Creates a mock req object for Express middleware tests.
 */
export function makeMockReq(overrides: Record<string, any> = {}): any {
  return {
    headers: {},
    params: {},
    body: {},
    query: {},
    ...overrides,
  };
}

/**
 * Creates a mock res object for Express middleware tests.
 */
export function makeMockRes(): any {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
}

export const mockNext = jest.fn();
