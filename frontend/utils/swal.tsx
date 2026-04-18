
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export const confirmDestructive = async (title: string, text: string) => {
  const result = await MySwal.fire({
    title: <span className="font-serif text-amber-900">{title}</span>,
    html: <p className="text-stone-500 italic">{text}</p>,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#78716c',
    confirmButtonText: 'Xác nhận xóa',
    cancelButtonText: 'Quay lại',
    background: '#fcfaf7',
    borderRadius: '24px',
    customClass: {
        popup: 'rounded-3xl border border-stone-100 shadow-2xl',
        confirmButton: 'rounded-xl font-bold px-6 py-3',
        cancelButton: 'rounded-xl font-bold px-6 py-3'
    }
  });
  return result.isConfirmed;
};

export const promptInput = async (title: string, label: string, defaultValue: string = '', type: 'text' | 'password' = 'text') => {
  const result = await MySwal.fire({
    title: <span className="font-serif text-amber-900">{title}</span>,
    input: type,
    inputLabel: label,
    inputValue: defaultValue,
    showCancelButton: true,
    confirmButtonColor: '#d97706',
    cancelButtonColor: '#78716c',
    confirmButtonText: 'Xác nhận',
    cancelButtonText: 'Hủy',
    background: '#fcfaf7',
    borderRadius: '24px',
    customClass: {
        popup: 'rounded-3xl border border-stone-100 shadow-2xl',
        confirmButton: 'rounded-xl font-bold px-6 py-3',
        cancelButton: 'rounded-xl font-bold px-6 py-3',
        input: 'rounded-xl border-stone-200 focus:ring-amber-500 focus:border-amber-500'
    }
  });
  return result.value;
};

export const confirmAction = async (title: string, text: string) => {
  const result = await MySwal.fire({
    title: <span className="font-serif text-amber-900">{title}</span>,
    html: <p className="text-stone-500 italic">{text}</p>,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#d97706',
    cancelButtonColor: '#78716c',
    confirmButtonText: 'Xác nhận',
    cancelButtonText: 'Quay lại',
    background: '#fcfaf7',
    borderRadius: '24px',
    customClass: {
        popup: 'rounded-3xl border border-stone-100 shadow-2xl',
        confirmButton: 'rounded-xl font-bold px-6 py-3',
        cancelButton: 'rounded-xl font-bold px-6 py-3'
    }
  });
  return result.isConfirmed;
};

export const promptTokenAdjustment = async (title: string, username: string) => {
    const result = await MySwal.fire({
        title: <span className="font-serif text-amber-900">{title}</span>,
        html: (
            <div className="space-y-4 text-left">
                <p className="text-stone-500 text-sm italic">Người dùng: <span className="font-bold text-stone-800">{username}</span></p>
                <div>
                    <label className="text-[10px] font-black uppercase text-stone-400 tracking-widest mb-2 block">Loại điều chỉnh</label>
                    <select id="swal-tx-type" className="w-full bg-stone-50 border border-stone-100 p-3 rounded-xl focus:outline-none focus:border-amber-500 font-bold text-sm">
                        <option value="in">Cộng thêm (+)</option>
                        <option value="out">Khấu trừ (-)</option>
                    </select>
                </div>
                <div>
                    <label className="text-[10px] font-black uppercase text-stone-400 tracking-widest mb-2 block">Số lượng tokens</label>
                    <input id="swal-amount" type="number" step="0.01" className="w-full bg-stone-50 border border-stone-100 p-3 rounded-xl focus:outline-none focus:border-amber-500 font-bold text-lg text-amber-600" placeholder="0.00" />
                </div>
            </div>
        ),
        showCancelButton: true,
        confirmButtonColor: '#d97706',
        cancelButtonColor: '#78716c',
        confirmButtonText: 'Xác nhận',
        cancelButtonText: 'Hủy',
        background: '#fcfaf7',
        borderRadius: '24px',
        preConfirm: () => {
            const type = (document.getElementById('swal-tx-type') as HTMLSelectElement).value;
            const amount = (document.getElementById('swal-amount') as HTMLInputElement).value;
            if (!amount || parseFloat(amount) <= 0) {
                Swal.showValidationMessage('Vui lòng nhập số lượng hợp lệ');
                return false;
            }
            return { type, amount: parseFloat(amount) };
        }
    });
    return result.value;
};

export const alertSuccess = (title: string, text: string) => {
    MySwal.fire({
        title: <span className="font-serif text-amber-900">{title}</span>,
        html: <p className="text-stone-500">{text}</p>,
        icon: 'success',
        confirmButtonColor: '#d97706',
        background: '#fcfaf7',
        borderRadius: '24px'
    });
};
