<!DOCTYPE html>
<html>
<head>
    <title>Leave Requests</title>
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
        <h1>Laporan Pengajuan Cuti</h1>
        <p>Dicetak pada: {{ now()->format('d-m-Y H:i') }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Karyawan</th>
                <th>Jenis Cuti</th>
                <th>Mulai</th>
                <th>Selesai</th>
                <th>Alasan</th>
                <th>Status</th>
                <th>Diajukan</th>
            </tr>
        </thead>
        <tbody>
            @foreach($requests as $request)
                <tr>
                    <td>{{ $request->id }}</td>
                    <td>{{ $request->employee->full_name ?? '-' }}</td>
                    <td>{{ $request->leaveType->name ?? '-' }}</td>
                    <td>{{ \Carbon\Carbon::parse($request->start_date)->format('d-m-Y') }}</td>
                    <td>{{ \Carbon\Carbon::parse($request->end_date)->format('d-m-Y') }}</td>
                    <td>{{ $request->reason }}</td>
                    <td class="status">{{ str_replace('_', ' ', $request->status) }}</td>
                    <td>{{ $request->created_at->format('d-m-Y H:i') }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
