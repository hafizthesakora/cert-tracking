// Location: src/components/ActionModal.tsx
import { initiateRenewal, confirmRenewal } from '@/app/actions';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  employeeCertId: string;
  actionType: 'initiate' | 'confirm';
};

export default function ActionModal({
  isOpen,
  onClose,
  employeeCertId,
  actionType,
}: Props) {
  if (!isOpen) return null;

  const today = new Date().toISOString().split('T')[0];

  const formAction =
    actionType === 'initiate' ? initiateRenewal : confirmRenewal;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
        <h2 className="text-lg font-bold mb-4">
          {actionType === 'initiate' ? 'Schedule Renewal' : 'Confirm Renewal'}
        </h2>
        <form
          action={async (formData) => {
            await formAction(formData);
            onClose();
          }}
        >
          <input type="hidden" name="employeeCertId" value={employeeCertId} />
          {actionType === 'initiate' ? (
            <div>
              <label
                htmlFor="renewalDate"
                className="block text-sm font-medium text-gray-700"
              >
                Select Renewal Date
              </label>
              <input
                type="date"
                id="renewalDate"
                name="renewalDate"
                className="input-field mt-1"
                required
                min={today}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="issueDate"
                  className="block text-sm font-medium text-gray-700"
                >
                  New Issue Date
                </label>
                <input
                  type="date"
                  id="issueDate"
                  name="issueDate"
                  className="input-field mt-1"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="expiryDate"
                  className="block text-sm font-medium text-gray-700"
                >
                  New Expiry Date
                </label>
                <input
                  type="date"
                  id="expiryDate"
                  name="expiryDate"
                  className="input-field mt-1"
                  required
                />
              </div>
            </div>
          )}
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
