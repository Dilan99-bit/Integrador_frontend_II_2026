export const REGISTROS_STORAGE_KEY = 'cesde_registros_empresas'
export const SESSION_STORAGE_KEY = 'cesde_sesion_activa'
export const SESSION_ROLE_KEY = 'cesde_rol_activo'
export const SESSION_NAME_KEY = 'cesde_nombre_activo'
export const HASH_ITERATIONS = 310000

function encodeBase64(bytes) {
	return btoa(String.fromCharCode(...bytes))
}

function decodeBase64(value) {
	const binary = atob(value)
	return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}

export function loadCompanyRecords() {
	let storedRecords

	try {
		storedRecords = window.localStorage.getItem(REGISTROS_STORAGE_KEY)
	} catch (error) {
		if (!(error instanceof DOMException)) throw error
		throw new Error('No se permitió acceder a los registros.', { cause: error })
	}

	if (!storedRecords) return []

	let records
	try {
		records = JSON.parse(storedRecords)
	} catch (error) {
		if (!(error instanceof SyntaxError)) throw error
		throw new Error('Los registros no se pudieron leer.', { cause: error })
	}

	if (!Array.isArray(records)) {
		throw new Error('El almacenamiento de registros tiene un formato inválido.')
	}

	return records
}

export async function createPasswordVerifier(password) {
	if (!window.crypto?.subtle) {
		throw new Error('Este navegador no permite proteger la clave de forma segura.')
	}

	const salt = window.crypto.getRandomValues(new Uint8Array(16))
	const keyMaterial = await window.crypto.subtle.importKey(
		'raw',
		new TextEncoder().encode(password),
		'PBKDF2',
		false,
		['deriveBits'],
	)
	const derivedBits = await window.crypto.subtle.deriveBits(
		{
			name: 'PBKDF2',
			salt,
			iterations: HASH_ITERATIONS,
			hash: 'SHA-256',
		},
		keyMaterial,
		256,
	)

	return {
		passwordSalt: encodeBase64(salt),
		passwordHash: encodeBase64(new Uint8Array(derivedBits)),
		passwordHashIterations: HASH_ITERATIONS,
	}
}

export async function verifyPassword(password, record) {
	if (
		typeof record?.passwordHash !== 'string'
		|| typeof record.passwordSalt !== 'string'
		|| !Number.isInteger(record.passwordHashIterations)
		|| record.passwordHashIterations < 1
		|| record.passwordHashIterations > 1000000
	) {
		return false
	}

	if (!window.crypto?.subtle) {
		throw new Error('Este navegador no permite verificar la clave de forma segura.')
	}

	const salt = decodeBase64(record.passwordSalt)
	const expectedHash = decodeBase64(record.passwordHash)
	if (salt.length !== 16 || expectedHash.length !== 32) return false

	const keyMaterial = await window.crypto.subtle.importKey(
		'raw',
		new TextEncoder().encode(password),
		'PBKDF2',
		false,
		['deriveBits'],
	)
	const derivedBits = await window.crypto.subtle.deriveBits(
		{
			name: 'PBKDF2',
			salt,
			iterations: record.passwordHashIterations,
			hash: 'SHA-256',
		},
		keyMaterial,
		256,
	)
	const actualHash = new Uint8Array(derivedBits)
	let difference = 0

	for (let index = 0; index < expectedHash.length; index += 1) {
		difference |= expectedHash[index] ^ actualHash[index]
	}

	return difference === 0
}
