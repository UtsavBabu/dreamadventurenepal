
function buildObjectPayload(form) {
  const payload = {};
  form.querySelectorAll('[data-json-name]:not([data-group-index])').forEach((field) => {
    payload[field.dataset.jsonName] = field.value;
  });
  return payload;
}

function buildArrayPayload(form) {
  const grouped = {};
  form.querySelectorAll('[data-json-name][data-group-index]').forEach((field) => {
    const index = field.dataset.groupIndex;
    if (!grouped[index]) grouped[index] = {};
    grouped[index][field.dataset.jsonName] = field.value;
  });

  return Object.keys(grouped)
    .sort((a, b) => Number(a) - Number(b))
    .map((key) => grouped[key]);
}

function prepareSettingsForms() {
  document.querySelectorAll('.js-settings-form').forEach((form) => {
    form.addEventListener('submit', () => {
      const type = form.dataset.sectionType || 'object';
      const hiddenPayload = form.querySelector('input[name="payload"]');
      if (!hiddenPayload) return;

      const payload = type === 'array'
        ? buildArrayPayload(form)
        : buildObjectPayload(form);

      hiddenPayload.value = JSON.stringify(payload);
    });
  });
}

async function uploadToField(targetId, previewId) {
  const picker = document.createElement('input');
  picker.type = 'file';
  picker.accept = 'image/*';
  picker.click();

  picker.addEventListener('change', async () => {
    const file = picker.files && picker.files[0];
    if (!file) return;

    const target = document.getElementById(targetId);
    const preview = document.getElementById(previewId);

    if (preview) {
      preview.classList.remove('hidden');
      preview.classList.remove('placeholder');
      preview.innerHTML = '<div style="padding:14px;color:#667792;">Uploading image...</div>';
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/admin/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (!response.ok || !data.path) throw new Error('Upload failed');

      if (target) target.value = data.path;
      if (preview) preview.innerHTML = `<img src="${data.path}" alt="Preview">`;
    } catch (error) {
      if (preview) {
        preview.innerHTML = '<div style="padding:14px;color:#c9342c;">Upload failed. Please try again.</div>';
      }
      alert('Image upload failed.');
    }
  }, { once: true });
}

function bindUploadButtons() {
  document.querySelectorAll('.js-upload-btn').forEach((button) => {
    button.addEventListener('click', () => {
      uploadToField(button.dataset.target, button.dataset.preview);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  prepareSettingsForms();
  bindUploadButtons();
});
