export interface XsmbDraw {
  date: string;
  special: string;
  /** All 27 two-digit endings from the Northern lottery draw, including the special prize. */
  loto: string[];
}

export interface XsmbHistoryResponse {
  source: 'live' | 'snapshot';
  sourceName: string;
  sourceUrl: string;
  checkedAt: string;
  startDate: string;
  endDate: string;
  drawCount: number;
  draws: XsmbDraw[];
  notice?: string;
}

export async function fetchXsmbHistory(days = 100, refresh = false): Promise<XsmbHistoryResponse> {
  const boundedDays = Math.max(1, Math.min(100, Math.floor(days)));
  const response = await fetch('/api/xsmb/results?days=' + boundedDays + (refresh ? '&refresh=1' : ''), {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });

  const payload = await response.json().catch(() => null) as XsmbHistoryResponse | null;
  if (!response.ok || !payload || !Array.isArray(payload.draws)) {
    const message = payload && typeof (payload as { error?: unknown }).error === 'string'
      ? (payload as { error: string }).error
      : 'Không thể tải dữ liệu XSMB.';
    throw new Error(message);
  }

  for (const draw of payload.draws) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(draw.date)
      || !/^\d{2}$/.test(draw.special)
      || !Array.isArray(draw.loto)
      || draw.loto.length !== 27
      || draw.loto.some(value => !/^\d{2}$/.test(value))) {
      throw new Error('Dữ liệu XSMB trả về không đúng định dạng; đã dừng hiển thị để tránh thống kê sai.');
    }
  }
  return payload;
}
