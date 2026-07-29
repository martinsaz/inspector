namespace checklist.Models.Firebase
{
	public class UsuarioGoogle
	{
		public string uid { get; set; }
		public string displayName { get; set; }
		public string photoURL { get; set; }
		public string email { get; set; }
		public bool emailVerified { get; set; }
		public object phoneNumber { get; set; }
		public bool isAnonymous { get; set; }
		public object tenantId { get; set; }
		public Providerdata[] providerData { get; set; }
		public string apiKey { get; set; }
		public string appName { get; set; }
		public string authDomain { get; set; }
		public Ststokenmanager stsTokenManager { get; set; }
		public object redirectEventId { get; set; }
		public string lastLoginAt { get; set; }
		public string createdAt { get; set; }
		public Multifactor multiFactor { get; set; }
	}

	public class Ststokenmanager
	{
		public string apiKey { get; set; }
		public string refreshToken { get; set; }
		public string accessToken { get; set; }
		public long expirationTime { get; set; }
	}

	public class Multifactor
	{
		public object[] enrolledFactors { get; set; }
	}

	public class Providerdata
	{
		public string uid { get; set; }
		public string displayName { get; set; }
		public string photoURL { get; set; }
		public string email { get; set; }
		public object phoneNumber { get; set; }
		public string providerId { get; set; }
	}
}
