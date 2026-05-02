<!DOCTYPE html>
<html>
<head>
    <title>Overtime Requests</title>
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
        <h1>Laporan Pengajuan Lembur</h1>
        <p>Dicetak pada: {{ now()->format('d-m-Y H:i') }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Karyawan</th>
                <th>Tanggal</th>
                <th>Mulai</th>
                <th>Selesai</th>
                <th>Deskripsi</th>
                <th>Status</th>
                <th>Diajukan</th>
            </tr>
        </thead>
        <tbody>
            @foreach($requests as $request)
                <tr>
                    <td>{{ $request->id }}</td>
                    <td>{{ $request->employee->full_name ?? '-' }}</td>
                    <td>{{ \Carbon\Carbon::parse($request->date)->format('d-m-Y') }}</td>
                    <td>{{ substr($request->start_time, 0, 5) }}</td>
                    <td>{{ substr($request->end_time, 0, 5) }}</td>
                    <td>{{ $request->description }}</td>
                    <td class="status">{{ str_replace('_', ' ', $request->status) }}</td>
                    <td>{{ $request->created_at->format('d-m-Y H:i') }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
