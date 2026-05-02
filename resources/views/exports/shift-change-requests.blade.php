<!DOCTYPE html>
<html>
<head>
    <title>Shift Change Requests</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .status {
            text-transform: capitalize;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Laporan Penggantian Shift</h1>
        <p>Dicetak pada: {{ now()->format('d-m-Y H:i') }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Pemohon</th>
                <th>Karyawan Pengganti</th>
                <th>Tanggal Shift</th>
                <th>Shift</th>
                <th>Alasan</th>
                <th>Status</th>
                <th>Diajukan</th>
            </tr>
        </thead>
        <tbody>
            @foreach($requests as $request)
                <tr>
                    <td>{{ $request->id }}</td>
                    <td>{{ $request->requester->full_name ?? '-' }}</td>
                    <td>{{ $request->target->full_name ?? '-' }}</td>
                    <td>{{ \Carbon\Carbon::parse($request->request_date)->format('d-m-Y') }}</td>
                    <td>
                        @if($request->requesterShift)
                            {{ $request->requesterShift->name }} ({{ substr($request->requesterShift->start_time, 0, 5) }}-{{ substr($request->requesterShift->end_time, 0, 5) }})
                        @else
                            -
                        @endif
                    </td>
                    <td>{{ $request->reason }}</td>
                    <td class="status">{{ str_replace('_', ' ', $request->status) }}</td>
                    <td>{{ $request->created_at->format('d-m-Y H:i') }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
